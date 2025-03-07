package vn.thanhdattanphuoc.batdongsan360.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.domain.response.ResCreateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.domain.response.ResUpdateUserDTO;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.error.IdInvalidException;

@RestController
public class UserController {

    private UserService userService;
    final private PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/api/users")
    public ResponseEntity<ResCreateUserDTO> createNewUser(@RequestBody User user) throws IdInvalidException {

        boolean isEmailExist = this.userService.isEmailExist(user.getEmail());
        if (isEmailExist) {
            throw new IdInvalidException(
                    "Email " + user.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }

        String hashPassword = this.passwordEncoder.encode(user.getPassword());
        user.setPassword(hashPassword);
        User newUser = this.userService.handleCreateUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ResCreateUserDTO(newUser));
    }

    @DeleteMapping("/api/users/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable("id") long id) throws IdInvalidException {

        if (this.userService.fetchUserById(id) == null) {
            throw new IdInvalidException("User id " + id + " không hợp lệ");
        }

        this.userService.handleDeleteUser(id);

        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @GetMapping("/api/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") long id) {

        User fetchUser = this.userService.fetchUserById(id);

        return ResponseEntity.status(HttpStatus.OK).body(fetchUser);
    }

    @GetMapping("/api/users")
    public ResponseEntity<List<User>> getAllUser() {

        return ResponseEntity.status(HttpStatus.OK).body(this.userService.fetchAllUser());
    }

    @PutMapping("/api/users")
    public ResponseEntity<ResUpdateUserDTO> updateUser(@RequestBody User user) throws IdInvalidException {

        boolean isEmailExist = this.userService.isEmailExist(user.getEmail());
        User currentUser = this.userService.fetchUserById(user.getId());
        if (isEmailExist && !currentUser.getEmail().equals(user.getEmail())) {
            throw new IdInvalidException(
                    "Email " + user.getEmail() + " đã tồn tại, vui lòng sử dụng email khác.");
        }

        user.setPassword(this.passwordEncoder.encode(user.getPassword()));
        User newUser = this.userService.handleUpdateUser(user);
        if (newUser == null) {
            throw new IdInvalidException(
                    "User id " + user.getId() + " không tồn tại.");
        }
        return ResponseEntity.status(HttpStatus.OK).body(new ResUpdateUserDTO(newUser));
    }
}
