package vn.thanhdattanphuoc.batdongsan360.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.error.InputInvalidException;
import vn.thanhdattanphuoc.batdongsan360.util.request.CreateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.util.request.UpdateProfileDTO;
import vn.thanhdattanphuoc.batdongsan360.util.request.UserFilterRequest;
import vn.thanhdattanphuoc.batdongsan360.util.request.UserUpdateDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.ResCreateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.ResUpdateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.util.response.UserDTO;

@RestController
public class UserController {

    private UserService userService;
    final private PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/api/admin/users")
    public ResponseEntity<ResCreateUserDTO> createNewUser(@Valid @RequestBody CreateUserDTO createUserDTO)
            throws InputInvalidException {

        boolean isEmailExist = this.userService.isEmailExist(createUserDTO.getEmail());
        if (isEmailExist) {
            throw new InputInvalidException(
                    "Email " + createUserDTO.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }

        String hashPassword = this.passwordEncoder.encode(createUserDTO.getPassword());
        createUserDTO.setPassword(hashPassword);
        User newUser = this.userService.handleCreateUser(createUserDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ResCreateUserDTO(newUser));
    }

    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable("id") long id) throws InputInvalidException {

        if (this.userService.fetchUserById(id) == null) {
            throw new InputInvalidException("Id không hợp lệ: không tìm thấy user id " + id + ", ...");
        }

        this.userService.handleDeleteUser(id);

        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping("/api/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") long id) throws InputInvalidException {

        User fetchUser = this.userService.fetchUserById(id);

        if (fetchUser == null)
            throw new InputInvalidException("Id không hợp lệ: không tìm thấy user id " + id + ", ...");

        return ResponseEntity.status(HttpStatus.OK).body(fetchUser);
    }

    @PutMapping("/api/admin/users")
    public ResponseEntity<ResUpdateUserDTO> updateUser(@RequestBody UserUpdateDTO userUpdateDTO)
            throws InputInvalidException {

        User newUser = this.userService.handleUpdateUser(userUpdateDTO);
        if (newUser == null) {
            throw new InputInvalidException(
                    "User id " + userUpdateDTO.getId() + " không tồn tại.");
        }
        return ResponseEntity.status(HttpStatus.OK).body(new ResUpdateUserDTO(newUser));
    }

    @PutMapping("/api/users/update-profile")
    public ResponseEntity<ResUpdateUserDTO> updateProfile(@RequestBody UpdateProfileDTO userUpdateDTO)
            throws InputInvalidException {

        User newUser = this.userService.handleUpdateProfile(userUpdateDTO);
        if (newUser == null) {
            throw new InputInvalidException(
                    "User id " + userUpdateDTO.getId() + " không tồn tại.");
        }
        return ResponseEntity.status(HttpStatus.OK).body(new ResUpdateUserDTO(newUser));
    }

    @GetMapping("/api/admin/users")
    public ResponseEntity<Page<UserDTO>> getUsers(@ModelAttribute UserFilterRequest filter) {
        Page<UserDTO> users = userService.getUsers(filter);
        return ResponseEntity.ok(users);
    }
}
