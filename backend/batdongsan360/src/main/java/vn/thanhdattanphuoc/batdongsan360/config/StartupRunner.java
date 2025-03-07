package vn.thanhdattanphuoc.batdongsan360.config;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import vn.thanhdattanphuoc.batdongsan360.domain.Category;
import vn.thanhdattanphuoc.batdongsan360.domain.User;
import vn.thanhdattanphuoc.batdongsan360.domain.address.District;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Province;
import vn.thanhdattanphuoc.batdongsan360.domain.address.Ward;
import vn.thanhdattanphuoc.batdongsan360.repository.CategoryRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.UserRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.DistrictRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.ProvinceRepository;
import vn.thanhdattanphuoc.batdongsan360.repository.address.WardRepository;
import vn.thanhdattanphuoc.batdongsan360.service.UserService;
import vn.thanhdattanphuoc.batdongsan360.util.constant.GenderEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.PostTypeEnum;
import vn.thanhdattanphuoc.batdongsan360.util.constant.RoleEnum;

@Component
public class StartupRunner implements CommandLineRunner {

    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final WardRepository wardRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final UserService userService;

    public StartupRunner(ProvinceRepository provinceRepository, DistrictRepository districtRepository,
            WardRepository wardRepository, CategoryRepository categoryRepository, PasswordEncoder passwordEncoder,
            UserService userService) {
        this.provinceRepository = provinceRepository;
        this.districtRepository = districtRepository;
        this.wardRepository = wardRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    @Override
    public void run(String... args) {

        System.out.println(">>> START INIT DATABASE");

        System.out.println(">>> INIT TABLE 'users'");
        List<User> userList = new ArrayList<>();

        User user_1 = new User();
        user_1.setEmail("admin@gmail.com");
        user_1.setName("Test1");
        user_1.setPassword(this.passwordEncoder.encode("123456"));
        user_1.setRole(RoleEnum.ADMIN);
        user_1.setGender(GenderEnum.MALE);
        user_1.setBalance(999999999);
        user_1.setPhone("0123456789");

        user_1.setAddress("Thành Phố Hồ Chí Minh");

        User user_2 = new User();
        user_2.setEmail("user@gmail.com");
        user_2.setName("Test2");
        user_2.setPassword(this.passwordEncoder.encode("123456"));
        user_2.setRole(RoleEnum.ADMIN);
        user_2.setGender(GenderEnum.MALE);
        user_2.setBalance(999999999);
        user_2.setPhone("0123456799");

        user_2.setAddress("Thành Phố Hồ Chí Minh");

        User user_3 = new User();
        user_3.setEmail("user3@gmail.com");
        user_3.setName("Test3");
        user_3.setPassword(this.passwordEncoder.encode("123456"));
        user_3.setRole(RoleEnum.ADMIN);
        user_3.setGender(GenderEnum.MALE);
        user_3.setBalance(999999999);
        user_3.setPhone("0123456799");

        user_3.setAddress("Thành Phố Hồ Chí Minh");

        userList.add(user_1);
        userList.add(user_2);
        userList.add(user_3);

        for (User user : userList) {
            boolean isEmailExist = this.userService.isEmailExist(user.getEmail());
            if (!isEmailExist) {
                this.userService.handleCreateUser(user);
            }
        }

        // Kiểm tra nếu database table provinces,dictrics,wars đã có dữ liệu thì không
        // init
        if (this.provinceRepository.count() > 0 || this.districtRepository.count() > 0
                || this.wardRepository.count() > 0) {
            System.out.println(
                    ">>> SKIP! INIT ADDRESS DATA TABLE 'provinces', 'districs', 'wards': ALREADY HAVE DATA ... ");
        } else {
            try {

                // Đọc file JSON từ resources
                try (InputStream inputStream = new ClassPathResource("/data/address.json").getInputStream()) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    List<Province> provinces = objectMapper.readValue(inputStream, new TypeReference<List<Province>>() {
                    });

                    for (Province province : provinces) {
                        this.provinceRepository.save(province);

                        if (province.getDistricts() != null) {
                            for (District district : province.getDistricts()) {
                                district.setProvince(province);
                                this.districtRepository.save(district);

                                if (district.getWards() != null) {
                                    for (Ward ward : district.getWards()) {
                                        ward.setDistrict(district);
                                        this.wardRepository.save(ward);
                                    }
                                }
                            }
                        }
                    }

                    System.out.println(">>> INIT ADDRESS DATA TABLE provinces, districs, wards : SUCCESS");

                } catch (Exception e) {
                    e.printStackTrace();
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (categoryRepository.count() > 0) {
            System.out.println(">>> SKIP! INIT ADDRESS DATA TABLE category: ALREADY HAVE DATA ... ");

        } else {

            ArrayList<Category> lst = new ArrayList<Category>();
            lst.add(new Category("Cho thuê căn hộ chung cư ", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê chung cư mini, căn hộ dịch vụ ", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê nhà riêng ", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê nhà biệt thự, liền kề", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê nhà mặt phố", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê shophouse, nhà phố thương mại", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê nhà trọ, phòng trọ", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê văn phòng", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê, sang nhượng cửa hàng, ki ốt", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê kho, nhà xưởng, đất ", PostTypeEnum.RENT));
            lst.add(new Category("Cho thuê loại bất động sản khác", PostTypeEnum.RENT));

            lst.add(new Category("Bán căn hộ chung cư ", PostTypeEnum.SALE));
            lst.add(new Category("Bán chung cư mini, căn hộ dịch vụ", PostTypeEnum.SALE));
            lst.add(new Category("Bán nhà riêng", PostTypeEnum.SALE));
            lst.add(new Category("Bán nhà biệt thự, liền kề", PostTypeEnum.SALE));
            lst.add(new Category("Bán nhà mặt phố", PostTypeEnum.SALE));
            lst.add(new Category("Bán shophouse, nhà phố thương mại", PostTypeEnum.SALE));
            lst.add(new Category("Bán đất nền dự án", PostTypeEnum.SALE));
            lst.add(new Category("Bán đất", PostTypeEnum.SALE));
            lst.add(new Category("Bán trang trại, khu nghỉ dưỡng ", PostTypeEnum.SALE));
            lst.add(new Category("Bán condotel", PostTypeEnum.SALE));
            lst.add(new Category("Bán kho, nhà xưởng", PostTypeEnum.SALE));
            lst.add(new Category("Bán loại bất động sản khác", PostTypeEnum.SALE));

            this.categoryRepository.saveAll(lst);

            System.out.println(">>> INIT ADDRESS DATA TABLE 'categories' : SUCCESS");
        }

    }
}
